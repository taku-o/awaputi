/**
 * StatisticsManager.js (リファクタリング版)
 * 統計管理の中央コーディネータークラス
 * 分割されたコンポーネントを統合し、統一されたAPIを提供
 */

// Removed unused imports - using stub implementations for now

/**
 * 統計管理クラス（リファクタリング版）
 */
// Statistics component imports - using dynamic imports for now as the module structure needs to be verified
// import { //     getStatisticsDataManager, 
//     getStatisticsCalculator, 
//     getStatisticsTimeSeriesManager, 
//     getStatisticsExporter,
//     getStatisticsEventHandler   }
// } from './statistics/index.js';

// Type definitions
interface BubbleData { type: string,
    score: number;
    position?: { x: number, y: number;
    size?: number;
}

interface ComboData { count: number,
    multiplier: number;
    type?: string;
    interface DamageData { amount: number;
    source?: string;
    interface HealData { amount: number;
    source?: string;
    interface EffectData { type: string;
    duration?: number;
    intensity?: number;
    interface DragData {
    startPosition: { ,x: number, y: number,
    endPosition: { x: number, y: number,
    duration: number;
}

interface AchievementData { id: string,
    name: string;
    progress?: number;
    interface ApData { amount: number;
    source?: string;
    interface ItemData { id: string,
    name: string,
    cost: number;
    interface GameEndData { finalScore: number,
    playTime: number,
    completed: boolean,
    stageId: string,
    bubblesPopped: number;
    interface Statistics { totalGamesPlayed: number,
    totalScore: number,
    totalPlayTime: number,
    highestScore: number,
    stagesCompleted: number,
    stagesFailed: number,
    totalBubblesPopped: number,
    totalBubblesMissed: number,
    bubbleTypeStats: Record<string, number>;
    averageScore: number,
    bubbleAccuracy: number;
    interface SessionStats { bubblesThisSession: number,
    missedThisSession: number,
    scoreThisSession: number,
    startTime: number;
    interface ValidationResult { isValid: boolean,
    repaired: Statistics;
    interface GenerateTestStatisticsOptions { gamesCount?: number,
    scoreRange?: [number, number];
    playTimeRange?: [number, number];
    bubbleTypesEnabled?: boolean;
    interface StatisticsDataManager { initializeStatistics(): Statistics,
    initializeSessionStats(): SessionStats;
    validateStatistics(stats: Statistics): ValidationResult;
    interface StatisticsCalculator { getDetailedStatistics(stats: Statistics, sessionStats: SessionStats): any;
    calculateRankings(stats: Statistics): any;
    getFavoriteStage(stats: Statistics): string;
    interface StatisticsTimeSeriesManager { recordTimeSeriesData(score: number, playTime: number, completed: boolean, metadata: any): void;
    getAggregatedTimeSeriesData(period: string, days: number): any;
    getTimeSeriesStatisticsSummary(): any;
    getRecentPerformance(days: number): any;
    getPeakPlayingTimes(): any;
    getPlayTimeDistribution(): any;
    compareTimePeriods(period1: string, period2: string): any;
    clearData(): void;
    interface StatisticsExporter { exportData(stats: Statistics, format: string, options: any): string;
    interface StatisticsEventHandler { onGameStart(stageId: string): void;
    onGameEnd(data: GameEndData): void;
    onBubblePopped(bubbleData: BubbleData): void;
    onComboUpdate(comboData: ComboData): void;
    onDamageTaken(damageData: DamageData): void;
    onHpHealed(healData: HealData): void;
    onRevived(): void;
    onSpecialEffect(effectData: EffectData): void;
    onDragOperation(dragData: DragData): void;
    onAchievementUnlocked(achievementData: AchievementData): void;
    onApEarned(apData: ApData): void;
    onItemPurchased(itemData: ItemData): void;
    interface StatisticsCollector { collectEvent(eventType: string, data: any): void;
    interface StatisticsAnalyzer { // Methods would be defined based on the actual StatisticsAnalyzer implementation }

interface GameEngine { // GameEngine interface would be defined elsewhere }

export class StatisticsManager {
    // @ts-ignore - unused but kept for future implementation
    private __gameEngine: GameEngine, // prefixed with __ as unused
    private dataManager: StatisticsDataManager;
    private calculator: StatisticsCalculator;
    private timeSeriesManager: StatisticsTimeSeriesManager;
    private exporter: StatisticsExporter;
    private eventHandler: StatisticsEventHandler;
    private collector: StatisticsCollector | null;
    private analyzer: StatisticsAnalyzer | null;
    private statistics: Statistics;
    private, sessionStats: SessionStats;
    constructor(gameEngine: GameEngine) {
    
        this.__gameEngine = gameEngine;
        
        // 分割されたコンポーネントを初期化（スタブ実装）
        this.dataManager = this.createStubDataManager();
        this.calculator = this.createStubCalculator();
        this.timeSeriesManager = this.createStubTimeSeriesManager();
        this.exporter = this.createStubExporter();
        
        // 統計データとセッション統計を初期化
        this.statistics = this.dataManager.initializeStatistics();
        this.sessionStats = this.dataManager.initializeSessionStats();
        
        // イベントハンドラーを初期化（統計データへの参照を渡す）
        this.eventHandler = this.createStubEventHandler();
        
        // 外部システムとの統合（遅延読み込み）
        this.collector = null;
        this.analyzer = null;
        this.initializeExternalSystems();
        // データの読み込み
    
    };
        this.load(); }
    }

    // ========== スタブ実装メソッド ==========
    
    private createStubDataManager(): StatisticsDataManager { return { initializeStatistics: () => ({
                totalGamesPlayed: 0,
                totalScore: 0,
                totalPlayTime: 0,
                highestScore: 0,
                stagesCompleted: 0,
                stagesFailed: 0,
    totalBubblesPopped: 0 };
                totalBubblesMissed: 0 }
                bubbleTypeStats: { normal: 0, fast: 0, large: 0, bonus: 0  ,
                averageScore: 0,
    bubbleAccuracy: 0;
            },
            initializeSessionStats: () => ({ bubblesThisSession: 0,
                missedThisSession: 0,
                scoreThisSession: 0,
    startTime: Date.now( };
            validateStatistics: (stats: Statistics) => ({ isValid: true, repaired: stats,);
        }
    
    private createStubCalculator(): StatisticsCalculator { return { }
            getDetailedStatistics: () => ({});
            calculateRankings: () => ({}),''
            getFavoriteStage: () => 'None';
        } }
    
    private createStubTimeSeriesManager(): StatisticsTimeSeriesManager { return { }
            recordTimeSeriesData: () => {};
            getAggregatedTimeSeriesData: () => ({});
            getTimeSeriesStatisticsSummary: () => ({});
            getRecentPerformance: () => ({});
            getPeakPlayingTimes: () => ({});
            getPlayTimeDistribution: () => ({});
            compareTimePeriods: () => ({});
            clearData: () => {}
    ';'

    private createStubExporter(): StatisticsExporter { return { }'

            exportData: () => '{'
    }
    
    private createStubEventHandler(): StatisticsEventHandler { return { }
            onGameStart: () => {};
            onGameEnd: () => {};
            onBubblePopped: () => {};
            onComboUpdate: () => {};
            onDamageTaken: () => {};
            onHpHealed: () => {};
            onRevived: () => {};
            onSpecialEffect: () => {};
            onDragOperation: () => {};
            onAchievementUnlocked: () => {};
            onApEarned: () => {};
            onItemPurchased: () => {}
    
    /**
     * 外部システムを初期化'
     */''
    private async initializeExternalSystems()';'
                const { StatisticsCollector } = await import('./StatisticsCollector.js);'

                this.collector = new StatisticsCollector(this);'} catch (error) { console.warn('StatisticsCollector not available, using fallback mode:', error }'
            
            // StatisticsAnalyzerの統合
            try { }

                const { StatisticsAnalyzer } = await import('./StatisticsAnalyzer.js);'

                this.analyzer = new StatisticsAnalyzer(this);'} catch (error) {'
                console.warn('StatisticsAnalyzer not available, using fallback mode:', error',' }
        } catch (error) { console.error('Error initializing external systems:', error }
    }

    // ========== ゲームイベントハンドリング ==========

    /**
     * ゲーム開始時の統計更新
     * @param stageId - ステージID
     */
    onGameStart(stageId: string): void { try {
            this.eventHandler.onGameStart(stageId);
            // StatisticsCollectorでのイベント収集
            if (this.collector) {', ' }

                this.collector.collectEvent('game_started', { stageId ',' }
        } catch (error) { console.error('Error in onGameStart:', error }
    }

    /**
     * ゲーム終了時の統計更新
     * @param data - ゲーム終了データ
     */
    onGameEnd(data: GameEndData): void { try {
            this.eventHandler.onGameEnd(data);
            // 時系列データの記録
            this.timeSeriesManager.recordTimeSeriesData(
                data.finalScore);
                data.playTime),
                data.completed),
                { stageId: data.stageId, bubbles: data.bubblesPopped )
            ),
            // StatisticsCollectorでのイベント収集
            if (this.collector) {', '
}

                this.collector.collectEvent('game_ended', data'; }'
            }
            ';'

            this.save();'} catch (error) { console.error('Error in onGameEnd:', error }'
    }

    /**
     * 泡破壊時の統計更新
     * @param bubbleData - 泡データ
     */
    onBubblePopped(bubbleData: BubbleData): void { try {
            this.eventHandler.onBubblePopped(bubbleData),' }'

        } catch (error) { console.error('Error in onBubblePopped:', error }
    }

    /**
     * コンボ更新時の統計処理
     * @param comboData - コンボデータ
     */
    onComboUpdate(comboData: ComboData): void { try {
            this.eventHandler.onComboUpdate(comboData),' }'

        } catch (error) { console.error('Error in onComboUpdate:', error }
    }

    /**
     * ダメージ受ける時の統計更新
     * @param damageData - ダメージデータ
     */
    onDamageTaken(damageData: DamageData): void { try {
            this.eventHandler.onDamageTaken(damageData),' }'

        } catch (error) { console.error('Error in onDamageTaken:', error }
    }

    /**
     * HP回復時の統計更新
     * @param healData - 回復データ
     */
    onHpHealed(healData: HealData): void { try {
            this.eventHandler.onHpHealed(healData),' }'

        } catch (error) { console.error('Error in onHpHealed:', error }
    }

    /**
     * 復活時の統計更新
     */
    onRevived(): void { try {
            this.eventHandler.onRevived(),' }'

        } catch (error) { console.error('Error in onRevived:', error }
    }

    /**
     * 特殊効果発動時の統計更新
     * @param effectData - 効果データ
     */
    onSpecialEffect(effectData: EffectData): void { try {
            this.eventHandler.onSpecialEffect(effectData),' }'

        } catch (error) { console.error('Error in onSpecialEffect:', error }
    }

    /**
     * ドラッグ操作時の統計更新
     * @param dragData - ドラッグデータ
     */
    onDragOperation(dragData: DragData): void { try {
            this.eventHandler.onDragOperation(dragData),' }'

        } catch (error) { console.error('Error in onDragOperation:', error }
    }

    /**
     * 実績解除時の統計更新
     * @param achievementData - 実績データ
     */
    onAchievementUnlocked(achievementData: AchievementData): void { try {
            this.eventHandler.onAchievementUnlocked(achievementData),' }'

        } catch (error) { console.error('Error in onAchievementUnlocked:', error }
    }

    /**
     * APポイント獲得時の統計更新
     * @param apData - APデータ
     */
    onApEarned(apData: ApData): void { try {
            this.eventHandler.onApEarned(apData),' }'

        } catch (error) { console.error('Error in onApEarned:', error }
    }

    /**
     * アイテム購入時の統計更新
     * @param itemData - アイテムデータ
     */
    onItemPurchased(itemData: ItemData): void { try {
            this.eventHandler.onItemPurchased(itemData),' }'

        } catch (error) { console.error('Error in onItemPurchased:', error }
    }

    // ========== データアクセス・分析 ==========

    /**
     * 詳細統計データを取得
     * @returns 詳細統計
     */
    getDetailedStatistics(): any { try {
            return this.calculator.getDetailedStatistics(this.statistics, this.sessionStats),' }'

        } catch (error) { console.error('Error in getDetailedStatistics:', error }
            return {};

    /**
     * 集計された時系列データを取得
     * @param period - 期間
     * @param days - 日数
     * @returns 集計データ'
     */''
    getAggregatedTimeSeriesData(period: string = 'daily', days: number = 30): any { try {
            return this.timeSeriesManager.getAggregatedTimeSeriesData(period, days),' }'

        } catch (error) { console.error('Error in getAggregatedTimeSeriesData:', error }
            return { score: [], efficiency: [], playTime: [], period, days, summary: { }
    }

    /**
     * 時系列統計サマリーを取得
     * @returns サマリー情報
     */
    getTimeSeriesStatisticsSummary(): any { try {
            return this.timeSeriesManager.getTimeSeriesStatisticsSummary(),' }'

        } catch (error) { console.error('Error in getTimeSeriesStatisticsSummary:', error }
            return {};

    /**
     * 最近のパフォーマンス情報を取得
     * @param days - 過去何日分
     * @returns パフォーマンス情報
     */
    getRecentPerformance(days: number = 7): any { try {
            return this.timeSeriesManager.getRecentPerformance(days),' }'

        } catch (error) { console.error('Error in getRecentPerformance:', error }
            return {};

    /**
     * ピーク時間帯を取得
     * @returns ピーク時間帯情報
     */
    getPeakPlayingTimes(): any { try {
            return this.timeSeriesManager.getPeakPlayingTimes(),' }'

        } catch (error) { console.error('Error in getPeakPlayingTimes:', error }
            return {};

    /**
     * プレイ時間分布を取得
     * @returns 時間分布情報
     */
    getPlayTimeDistribution(): any { try {
            return this.timeSeriesManager.getPlayTimeDistribution(),' }'

        } catch (error) { console.error('Error in getPlayTimeDistribution:', error }
            return {};

    /**
     * 期間比較分析
     * @param period1 - 比較期間1
     * @param period2 - 比較期間2
     * @returns 比較結果'
     */''
    compareTimePeriods(period1: string = '7d', period2: string = '14d): any { try {'
            return this.timeSeriesManager.compareTimePeriods(period1, period2),' }'

        } catch (error) { console.error('Error in compareTimePeriods:', error }
            return {};

    /**
     * ランキングを取得
     * @returns ランキング情報
     */
    getRankings(): any { try {
            return this.calculator.calculateRankings(this.statistics),' }'

        } catch (error) { console.error('Error in getRankings:', error }
            return {};

    /**
     * お気に入りステージを取得
     * @returns お気に入りステージ
     */
    getFavoriteStage(): string { try {
            return this.calculator.getFavoriteStage(this.statistics),' }'

        } catch (error) {
            console.error('Error in getFavoriteStage:', error','
            return 'None,

    /**
     * お気に入り泡タイプを取得
     * @returns お気に入り泡タイプ'
     */''
    getFavoriteBubbleType(',
            let, favoriteType = 'normal');
            for(const [type, count] of Object.entries(bubbleStats) {
        if (count > maxCount) {
                    maxCount = count }
                    favoriteType = type; }
}
';'

            return favoriteType;} catch (error) {
            console.error('Error in getFavoriteBubbleType:', error','
            return 'normal,

    // ========== データ永続化・インポート・エクスポート ==========

    /**
     * 統計データを保存
     */''
    save()','
            if (typeof, window !== 'undefined' && window.localStorage' { const dataToSave = {'
                    statistics: this.statistics,
                    sessionStats: this.sessionStats,
                    timestamp: Date.now(  }

                localStorage.setItem('awaputi_statistics', JSON.stringify(dataToSave); }
        } catch (error) { console.error('Error saving statistics:', error }
    }

    /**
     * 統計データを読み込み'
     */''
    load()';'
            if(typeof, window !== 'undefined' && window.localStorage' {'

                const savedData = localStorage.getItem('awaputi_statistics),'
                if (savedData) {
                    try {
                        const loadedData = JSON.parse(savedData);
                        if (loadedData) {
                            // 読み込んだデータをマージ
    }
                            this.integrateLoadedData(loadedData);' }'

                        } catch (parseError) {
                        console.warn('[StatisticsManager] Failed to parse saved data:', parseError','

                        // 破損したデータを削除
                        localStorage.removeItem('awaputi_statistics' }'

                }'} catch (error) { console.error('Error loading statistics:', error }'
    }

    /**
     * 読み込んだデータを統合
     * @param loadedData - 読み込まれたデータ
     */
    private integrateLoadedData(loadedData: any): void { try {
            if (loadedData.statistics) {
                // データの整合性チェック
                const validation = this.dataManager.validateStatistics(loadedData.statistics);
                if (validation.isValid) {
            }
                    this.statistics = loadedData.statistics; }

                } else {
                    console.warn('Loaded statistics data validation failed, using repaired data') }'
                    this.statistics = validation.repaired; }
}
';'

            if (loadedData.sessionStats) { this.sessionStats = loadedData.sessionStats,' }'

            } catch (error) { console.error('Error integrating loaded data:', error }
    }

    /**
     * 統計データをエクスポート
     * @param format - エクスポート形式
     * @param options - オプション
     * @returns エクスポートされたデータ'
     */''
    exportData(format: string = 'json', options: any = { ): string {
        try {
            return this.exporter.exportData(this.statistics, format, options),' }'

        } catch (error) {
            console.error('Error exporting data:', error','
            return ','

    /**
     * テストデータを生成
     * @param options - 生成オプション
     * @returns テストデータ
     */
    generateTestStatistics(options: GenerateTestStatisticsOptions = { ): Statistics {
        try {
            const { gamesCount = 100,
                scoreRange = [100, 10000],
                playTimeRange = [30000, 300000], // 30秒～5分,
                bubbleTypesEnabled = true } = options;

            const testStats = this.dataManager.initializeStatistics();
            
            // ランダムなゲームデータを生成
            for(let, i = 0; i < gamesCount; i++) {
                const score = Math.floor(Math.random() * (scoreRange[1] - scoreRange[0]) + scoreRange[0]),
                const playTime = Math.floor(Math.random() * (playTimeRange[1] - playTimeRange[0]) + playTimeRange[0]),
                const completed = Math.random() > 0.2, // 80%の確率で完了
                
                // 基本統計更新
                testStats.totalGamesPlayed++;
                testStats.totalScore += score,
                testStats.totalPlayTime += playTime,
                testStats.highestScore = Math.max(testStats.highestScore, score);
                if (completed) {
            }
                    testStats.stagesCompleted++; }
                } else { testStats.stagesFailed++ }
                
                // 泡統計生成
                if (bubbleTypesEnabled) {
                    const bubbleTypes = Object.keys(testStats.bubbleTypeStats);
                    const bubblesPopped = Math.floor(Math.random() * 50) + 10,
                    
                    for (let, j = 0, j < bubblesPopped, j++) {
                        const randomType = bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)] }
                        testStats.bubbleTypeStats[randomType]++; }
                    }
                    
                    testStats.totalBubblesPopped += bubblesPopped;
                    testStats.totalBubblesMissed += Math.floor(bubblesPopped * 0.1); // 10%ミス率
                }
            }
            
            // 計算フィールドの更新
            testStats.averageScore = testStats.totalScore / testStats.totalGamesPlayed;
            testStats.bubbleAccuracy = testStats.totalBubblesPopped / ;
                (testStats.totalBubblesPopped + testStats.totalBubblesMissed) * 100;
            ';'

            return testStats;} catch (error) {
            console.error('Error generating test statistics:', error);
            return this.dataManager.initializeStatistics();
    /**
     * 統計をリセット
     */
    reset(): void { try {
            this.statistics = this.dataManager.initializeStatistics();
            this.sessionStats = this.dataManager.initializeSessionStats();
            this.timeSeriesManager.clearData();
            this.save(),' }'

        } catch (error) { console.error('Error resetting statistics:', error }
    }

    /**
     * クリックレート（毎分）を計算
     * @returns クリック数/分
     */
    calculateClicksPerMinute(): number { try {
            const totalClicks = this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed,
            const totalMinutes = (this.statistics.totalPlayTime || 0) / 60000,
            ','

            return totalMinutes > 0 ? totalClicks / totalMinutes: 0,', '
        } catch (error) {
            console.error('Error calculating clicks per minute:', error);
            return 0,

    /**
     * セッション精度を計算
     * @returns セッション精度
     */
    calculateSessionAccuracy(): number { try {
            const sessionTotal = this.sessionStats.bubblesThisSession + (this.sessionStats.missedThisSession || 0),

            return sessionTotal > 0 ? (this.sessionStats.bubblesThisSession / sessionTotal) * 100 : 0,' }'

        } catch (error) {
            console.error('Error calculating session accuracy:', error);
            return 0,

    // 分析が利用可能かチェック
    isAnalysisAvailable(): boolean { return !!this.analyzer }

    // 統計データへの直接アクセス（後方互換性）
    getStatistics(): Statistics { return this.statistics }

    getSessionStats(): SessionStats { return this.sessionStats,

// シングルトンインスタンス管理
let statisticsManagerInstance: StatisticsManager | null = null,

/**
 * StatisticsManagerのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns StatisticsManager シングルトンインスタンス
 */
export function getStatisticsManager(gameEngine: any): StatisticsManager { if (!statisticsManagerInstance) {
        statisticsManagerInstance = new StatisticsManager(gameEngine) };
    return statisticsManagerInstance;
}

/**
 * StatisticsManagerのシングルトンインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns StatisticsManager 新しいシングルトンインスタンス
 */
export function reinitializeStatisticsManager(gameEngine: any): StatisticsManager { if (statisticsManagerInstance) {
        // 既存インスタンスのクリーンアップ（必要に応じて） }''
    statisticsManagerInstance = new StatisticsManager(gameEngine);
    return statisticsManagerInstance;
}

export default StatisticsManager;