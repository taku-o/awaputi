/**
 * StatisticsManager.js (リファクタリング版)
 * 統計管理の中央コーディネータークラス
 * 分割されたコンポーネントを統合し、統一されたAPIを提供
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { getStatisticsDataManager } from './StatisticsDataManager.js';
import { getStatisticsEventHandler } from './StatisticsEventHandler.js';
import { getStatisticsCalculator } from './StatisticsCalculator.js';
import { getStatisticsTimeSeriesManager } from './StatisticsTimeSeriesManager.js';
import { getStatisticsExporter } from './StatisticsExporter.js';

/**
 * 統計管理クラス（リファクタリング版）
 */
export class StatisticsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 分割されたコンポーネントを初期化
        this.dataManager = getStatisticsDataManager();
        this.calculator = getStatisticsCalculator();
        this.timeSeriesManager = getStatisticsTimeSeriesManager();
        this.exporter = getStatisticsExporter();
        
        // 統計データとセッション統計を初期化
        this.statistics = this.dataManager.initializeStatistics();
        this.sessionStats = this.dataManager.initializeSessionStats();
        
        // イベントハンドラーを初期化（統計データへの参照を渡す）
        this.eventHandler = getStatisticsEventHandler(this.statistics, this.sessionStats);
        
        // 外部システムとの統合（遅延読み込み）
        this.collector = null;
        this.analyzer = null;
        this.initializeExternalSystems();
        
        // データの読み込み
        this.load();
    }

    /**
     * 外部システムを初期化
     */
    async initializeExternalSystems() {
        try {
            // StatisticsCollectorの統合
            try {
                const { StatisticsCollector } = await import('./StatisticsCollector.js');
                this.collector = new StatisticsCollector(this);
            } catch (error) {
                console.warn('StatisticsCollector not available, using fallback mode:', error);
            }
            
            // StatisticsAnalyzerの統合
            try {
                const { StatisticsAnalyzer } = await import('./StatisticsAnalyzer.js');
                this.analyzer = new StatisticsAnalyzer(this);
            } catch (error) {
                console.warn('StatisticsAnalyzer not available, using fallback mode:', error);
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'initializeExternalSystems');
        }
    }

    // ========== ゲームイベントハンドリング ==========

    /**
     * ゲーム開始時の統計更新
     * @param {string} stageId - ステージID
     */
    onGameStart(stageId) {
        try {
            this.eventHandler.onGameStart(stageId);
            
            // StatisticsCollectorでのイベント収集
            if (this.collector) {
                this.collector.collectEvent('game_started', { stageId });
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onGameStart');
        }
    }

    /**
     * ゲーム終了時の統計更新
     * @param {Object} data - ゲーム終了データ
     */
    onGameEnd(data) {
        try {
            this.eventHandler.onGameEnd(data);
            
            // 時系列データの記録
            this.timeSeriesManager.recordTimeSeriesData(
                data.finalScore, 
                data.playTime, 
                data.completed,
                { stageId: data.stageId, bubbles: data.bubblesPopped }
            );
            
            // StatisticsCollectorでのイベント収集
            if (this.collector) {
                this.collector.collectEvent('game_ended', data);
            }
            
            this.save();
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onGameEnd');
        }
    }

    /**
     * 泡破壊時の統計更新
     * @param {Object} bubbleData - 泡データ
     */
    onBubblePopped(bubbleData) {
        try {
            this.eventHandler.onBubblePopped(bubbleData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onBubblePopped');
        }
    }

    /**
     * コンボ更新時の統計処理
     * @param {Object} comboData - コンボデータ
     */
    onComboUpdate(comboData) {
        try {
            this.eventHandler.onComboUpdate(comboData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onComboUpdate');
        }
    }

    /**
     * ダメージ受ける時の統計更新
     * @param {Object} damageData - ダメージデータ
     */
    onDamageTaken(damageData) {
        try {
            this.eventHandler.onDamageTaken(damageData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onDamageTaken');
        }
    }

    /**
     * HP回復時の統計更新
     * @param {Object} healData - 回復データ
     */
    onHpHealed(healData) {
        try {
            this.eventHandler.onHpHealed(healData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onHpHealed');
        }
    }

    /**
     * 復活時の統計更新
     */
    onRevived() {
        try {
            this.eventHandler.onRevived();
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onRevived');
        }
    }

    /**
     * 特殊効果発動時の統計更新
     * @param {Object} effectData - 効果データ
     */
    onSpecialEffect(effectData) {
        try {
            this.eventHandler.onSpecialEffect(effectData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onSpecialEffect');
        }
    }

    /**
     * ドラッグ操作時の統計更新
     * @param {Object} dragData - ドラッグデータ
     */
    onDragOperation(dragData) {
        try {
            this.eventHandler.onDragOperation(dragData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onDragOperation');
        }
    }

    /**
     * 実績解除時の統計更新
     * @param {Object} achievementData - 実績データ
     */
    onAchievementUnlocked(achievementData) {
        try {
            this.eventHandler.onAchievementUnlocked(achievementData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onAchievementUnlocked');
        }
    }

    /**
     * APポイント獲得時の統計更新
     * @param {Object} apData - APデータ
     */
    onApEarned(apData) {
        try {
            this.eventHandler.onApEarned(apData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onApEarned');
        }
    }

    /**
     * アイテム購入時の統計更新
     * @param {Object} itemData - アイテムデータ
     */
    onItemPurchased(itemData) {
        try {
            this.eventHandler.onItemPurchased(itemData);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'onItemPurchased');
        }
    }

    // ========== データアクセス・分析 ==========

    /**
     * 詳細統計データを取得
     * @returns {Object} 詳細統計
     */
    getDetailedStatistics() {
        try {
            return this.calculator.getDetailedStatistics(this.statistics, this.sessionStats);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getDetailedStatistics');
            return {};
        }
    }

    /**
     * 集計された時系列データを取得
     * @param {string} period - 期間
     * @param {number} days - 日数
     * @returns {Object} 集計データ
     */
    getAggregatedTimeSeriesData(period = 'daily', days = 30) {
        try {
            return this.timeSeriesManager.getAggregatedTimeSeriesData(period, days);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getAggregatedTimeSeriesData');
            return { score: [], efficiency: [], playTime: [], period, days, summary: {} };
        }
    }

    /**
     * 時系列統計サマリーを取得
     * @returns {Object} サマリー情報
     */
    getTimeSeriesStatisticsSummary() {
        try {
            return this.timeSeriesManager.getTimeSeriesStatisticsSummary();
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getTimeSeriesStatisticsSummary');
            return {};
        }
    }

    /**
     * 最近のパフォーマンス情報を取得
     * @param {number} days - 過去何日分
     * @returns {Object} パフォーマンス情報
     */
    getRecentPerformance(days = 7) {
        try {
            return this.timeSeriesManager.getRecentPerformance(days);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getRecentPerformance');
            return {};
        }
    }

    /**
     * ピーク時間帯を取得
     * @returns {Object} ピーク時間帯情報
     */
    getPeakPlayingTimes() {
        try {
            return this.timeSeriesManager.getPeakPlayingTimes();
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getPeakPlayingTimes');
            return {};
        }
    }

    /**
     * プレイ時間分布を取得
     * @returns {Object} 時間分布情報
     */
    getPlayTimeDistribution() {
        try {
            return this.timeSeriesManager.getPlayTimeDistribution();
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getPlayTimeDistribution');
            return {};
        }
    }

    /**
     * 期間比較分析
     * @param {string} period1 - 比較期間1
     * @param {string} period2 - 比較期間2
     * @returns {Object} 比較結果
     */
    compareTimePeriods(period1 = '7d', period2 = '14d') {
        try {
            return this.timeSeriesManager.compareTimePeriods(period1, period2);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'compareTimePeriods');
            return {};
        }
    }

    /**
     * ランキングを取得
     * @returns {Object} ランキング情報
     */
    getRankings() {
        try {
            return this.calculator.calculateRankings(this.statistics);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getRankings');
            return {};
        }
    }

    /**
     * お気に入りステージを取得
     * @returns {string} お気に入りステージ
     */
    getFavoriteStage() {
        try {
            return this.calculator.getFavoriteStage(this.statistics);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getFavoriteStage');
            return 'None';
        }
    }

    /**
     * お気に入り泡タイプを取得
     * @returns {string} お気に入り泡タイプ
     */
    getFavoriteBubbleType() {
        try {
            const bubbleStats = this.statistics.bubbleTypeStats || {};
            let maxCount = 0;
            let favoriteType = 'normal';

            for (const [type, count] of Object.entries(bubbleStats)) {
                if (count > maxCount) {
                    maxCount = count;
                    favoriteType = type;
                }
            }

            return favoriteType;
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'getFavoriteBubbleType');
            return 'normal';
        }
    }

    // ========== データ永続化・インポート・エクスポート ==========

    /**
     * 統計データを保存
     */
    save() {
        try {
            this.exporter.save(this.statistics, this.sessionStats);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'save');
        }
    }

    /**
     * 統計データを読み込み
     */
    load() {
        try {
            const loadedData = this.exporter.load();
            if (loadedData) {
                // 読み込んだデータをマージ
                this.integrateLoadedData(loadedData);
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'load');
        }
    }

    /**
     * 読み込んだデータを統合
     * @param {Object} loadedData - 読み込まれたデータ
     */
    integrateLoadedData(loadedData) {
        try {
            if (loadedData.statistics) {
                // データの整合性チェック
                const validation = this.dataManager.validateStatistics(loadedData.statistics);
                
                if (validation.isValid) {
                    this.statistics = loadedData.statistics;
                } else {
                    console.warn('Loaded statistics data validation failed, using repaired data');
                    this.statistics = validation.repaired;
                }
            }

            if (loadedData.sessionStats) {
                this.sessionStats = loadedData.sessionStats;
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'integrateLoadedData');
        }
    }

    /**
     * 統計データをエクスポート
     * @param {string} format - エクスポート形式
     * @param {Object} options - オプション
     * @returns {string} エクスポートされたデータ
     */
    exportData(format = 'json', options = {}) {
        try {
            return this.exporter.exportData(this.statistics, format, options);
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'exportData');
            return '';
        }
    }

    /**
     * テストデータを生成
     * @param {Object} options - 生成オプション
     * @returns {Object} テストデータ
     */
    generateTestStatistics(options = {}) {
        try {
            const {
                gamesCount = 100,
                scoreRange = [100, 10000],
                playTimeRange = [30000, 300000], // 30秒〜5分
                bubbleTypesEnabled = true
            } = options;

            const testStats = this.dataManager.initializeStatistics();
            
            // ランダムなゲームデータを生成
            for (let i = 0; i < gamesCount; i++) {
                const score = Math.floor(Math.random() * (scoreRange[1] - scoreRange[0]) + scoreRange[0]);
                const playTime = Math.floor(Math.random() * (playTimeRange[1] - playTimeRange[0]) + playTimeRange[0]);
                const completed = Math.random() > 0.2; // 80%の確率で完了
                
                // 基本統計更新
                testStats.totalGamesPlayed++;
                testStats.totalScore += score;
                testStats.totalPlayTime += playTime;
                testStats.highestScore = Math.max(testStats.highestScore, score);
                
                if (completed) {
                    testStats.stagesCompleted++;
                } else {
                    testStats.stagesFailed++;
                }
                
                // 泡統計生成
                if (bubbleTypesEnabled) {
                    const bubbleTypes = Object.keys(testStats.bubbleTypeStats);
                    const bubblesPopped = Math.floor(Math.random() * 50) + 10;
                    
                    for (let j = 0; j < bubblesPopped; j++) {
                        const randomType = bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)];
                        testStats.bubbleTypeStats[randomType]++;
                    }
                    
                    testStats.totalBubblesPopped += bubblesPopped;
                    testStats.totalBubblesMissed += Math.floor(bubblesPopped * 0.1); // 10%ミス率
                }
            }
            
            // 計算フィールドの更新
            testStats.averageScore = testStats.totalScore / testStats.totalGamesPlayed;
            testStats.bubbleAccuracy = testStats.totalBubblesPopped / 
                (testStats.totalBubblesPopped + testStats.totalBubblesMissed) * 100;
            
            return testStats;
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'generateTestStatistics');
            return this.dataManager.initializeStatistics();
        }
    }

    /**
     * 統計をリセット
     */
    reset() {
        try {
            this.statistics = this.dataManager.initializeStatistics();
            this.sessionStats = this.dataManager.initializeSessionStats();
            this.timeSeriesManager.clearData();
            this.save();
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'reset');
        }
    }

    /**
     * クリックレート（毎分）を計算
     * @returns {number} クリック数/分
     */
    calculateClicksPerMinute() {
        try {
            const totalClicks = this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed;
            const totalMinutes = (this.statistics.totalPlayTime || 0) / 60000;
            
            return totalMinutes > 0 ? totalClicks / totalMinutes : 0;
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'calculateClicksPerMinute');
            return 0;
        }
    }

    /**
     * セッション精度を計算
     * @returns {number} セッション精度
     */
    calculateSessionAccuracy() {
        try {
            const sessionTotal = this.sessionStats.bubblesThisSession + (this.sessionStats.missedThisSession || 0);
            return sessionTotal > 0 ? (this.sessionStats.bubblesThisSession / sessionTotal) * 100 : 0;
        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsManager', 'calculateSessionAccuracy');
            return 0;
        }
    }

    // 分析が利用可能かチェック
    isAnalysisAvailable() {
        return !!this.analyzer;
    }

    // 統計データへの直接アクセス（後方互換性）
    getStatistics() {
        return this.statistics;
    }

    getSessionStats() {
        return this.sessionStats;
    }
}

// シングルトンインスタンス管理
let statisticsManagerInstance = null;

/**
 * StatisticsManagerのシングルトンインスタンスを取得
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {StatisticsManager} シングルトンインスタンス
 */
export function getStatisticsManager(gameEngine) {
    if (!statisticsManagerInstance) {
        statisticsManagerInstance = new StatisticsManager(gameEngine);
    }
    return statisticsManagerInstance;
}

/**
 * StatisticsManagerのシングルトンインスタンスを再初期化
 * @param {Object} gameEngine - ゲームエンジン
 * @returns {StatisticsManager} 新しいシングルトンインスタンス
 */
export function reinitializeStatisticsManager(gameEngine) {
    if (statisticsManagerInstance) {
        // 既存インスタンスのクリーンアップ（必要に応じて）
    }
    statisticsManagerInstance = new StatisticsManager(gameEngine);
    return statisticsManagerInstance;
}

export default StatisticsManager;