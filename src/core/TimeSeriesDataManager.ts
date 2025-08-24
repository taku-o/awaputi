/**
 * 時系列データ管理クラス
 * 日別・週別・月別の統計データ管理と分析機能を提供
 */
export class TimeSeriesDataManager {
    private dailyData: Map<string, any>;
    private weeklyData: Map<string, any>;
    private monthlyData: Map<string, any>;
    private compressionManager: DataCompressionManager;
    private archiveManager: DataArchiveManager;
    private maxDataPoints: any;
    private currentPeriodKeys: any;
    private saveInterval: number;
    private lastSaveTime: number;

    constructor() {
        this.dailyData = new Map();
        this.weeklyData = new Map();
        this.monthlyData = new Map();
        
        // データ圧縮・アーカイブ
        this.compressionManager = new DataCompressionManager();
        this.archiveManager = new DataArchiveManager();
        
        // 設定
        this.maxDataPoints = {
            daily: 365,      // 1年間
            weekly: 52,      // 52週間
            monthly: 24      // 2年間 
        };
        
        // 現在の期間キー
        this.currentPeriodKeys = this.updateCurrentPeriodKeys();
        
        // データ保存間隔（ミリ秒）
        this.saveInterval = 300000; // 5分
        this.lastSaveTime = Date.now();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void {
        this.load();
        this.setupAutoSave();
        this.setupDataCleanup();
    }
    
    /**
     * データポイントの追加
     */
    addDataPoint(timestamp: number, category: string, value: number, metadata: any = {}): void {
        const date = new Date(timestamp);
        const dayKey = this.getDayKey(date);
        const weekKey = this.getWeekKey(date);
        const monthKey = this.getMonthKey(date);
        
        // 各期間のデータを更新
        this.updateTimeSeriesData(this.dailyData, dayKey, category, value, metadata);
        this.updateTimeSeriesData(this.weeklyData, weekKey, category, value, metadata);
        this.updateTimeSeriesData(this.monthlyData, monthKey, category, value, metadata);
        
        // 期間キーの更新
        this.updateCurrentPeriodKeys();
        
        // 自動保存チェック
        this.checkAutoSave();
    }
    
    /**
     * 時系列データの更新
     */
    updateTimeSeriesData(dataMap: Map<string, any>, periodKey: string, category: string, value: number, metadata: any): void {
        if (!dataMap.has(periodKey)) {
            dataMap.set(periodKey, {
                timestamp: Date.now(),
                categories: new Map(),
                totalDataPoints: 0,
                metadata: {}
            });
        }
        
        const periodData = dataMap.get(periodKey);
        
        if (!periodData.categories.has(category)) {
            periodData.categories.set(category, {
                values: [],
                total: 0,
                average: 0,
                min: Infinity,
                max: -Infinity,
                count: 0,
                trend: 'stable'
            });
        }
        
        const categoryData = periodData.categories.get(category);
        
        // 値の追加
        categoryData.values.push({
            value: value,
            timestamp: Date.now(),
            metadata: metadata
        });
        
        // 統計の更新
        categoryData.total += value;
        categoryData.count++;
        categoryData.average = categoryData.total / categoryData.count;
        categoryData.min = Math.min(categoryData.min, value);
        categoryData.max = Math.max(categoryData.max, value);
        
        // トレンドの計算
        categoryData.trend = this.calculateTrend(categoryData.values);
        
        // 期間データの更新
        periodData.totalDataPoints++;
        periodData.metadata = { ...periodData.metadata, ...metadata };
        
        // 値の数制限
        if (categoryData.values.length > 1000) {
            categoryData.values = categoryData.values.slice(-500); // 最新500個を保持
        }
    }
    
    /**
     * トレンドの計算
     */
    calculateTrend(values: any[]): string {
        if(values.length < 3) return 'stable';
        
        const recent = values.slice(-10); // 最新10個のデータポイント
        const older = values.slice(-20, -10); // その前の10個
        
        if(recent.length === 0 || older.length === 0) return 'stable';
        
        const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
        
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (changePercent > 10) {
            return 'improving';
        } else if (changePercent < -10) {
            return 'declining';
        } else {
            return 'stable';
        }
    }
    
    /**
     * 期間別データの取得
     */
    getTimeSeriesData(period: string, category: string | null = null, startDate: Date | null = null, endDate: Date | null = null): any[] {
        let dataMap: Map<string, any>;
        
        switch(period) {
            case 'daily':
                dataMap = this.dailyData;
                break;
            case 'weekly':
                dataMap = this.weeklyData;
                break;
            case 'monthly':
                dataMap = this.monthlyData;
                break;
            default:
                throw new Error(`Unsupported period: ${period}`);
        }
        
        const result = [];
        
        for(const [periodKey, periodData] of dataMap.entries()) {
            // 日付フィルター
            if (startDate || endDate) {
                const periodDate = this.parsePeriodKey(periodKey, period);
                if (startDate && periodDate < startDate) continue;
                if (endDate && periodDate > endDate) continue;
            }
            
            const entry = {
                period: periodKey,
                timestamp: periodData.timestamp,
                totalDataPoints: periodData.totalDataPoints,
                categories: {}
            };
            
            // カテゴリフィルター
            if (category) {
                if (periodData.categories.has(category)) {
                    entry.categories[category] = this.formatCategoryData(
                        periodData.categories.get(category)
                    );
                }
            } else {
                for(const [cat, catData] of periodData.categories.entries()) {
                    entry.categories[cat] = this.formatCategoryData(catData);
                }
            }
            
            result.push(entry);
        }
        
        // 期間順にソート
        result.sort((a, b) => a.period.localeCompare(b.period));
        
        return result;
    }
    
    /**
     * カテゴリデータのフォーマット
     */
    formatCategoryData(categoryData: any): any {
        return {
            total: categoryData.total,
            average: Math.round(categoryData.average * 100) / 100,
            min: categoryData.min === Infinity ? 0 : categoryData.min,
            max: categoryData.max === -Infinity ? 0 : categoryData.max,
            count: categoryData.count,
            trend: categoryData.trend,
            recentValues: categoryData.values.slice(-10) // 最新10個
        };
    }
    
    /**
     * 集計データの取得
     */
    getAggregatedData(category: string, period: string, aggregationType: string = 'sum'): any[] {
        const timeSeriesData = this.getTimeSeriesData(period, category);
        const result = timeSeriesData.map(entry => {
            const categoryData = entry.categories[category];
            if (!categoryData) return { period: entry.period, value: 0 };
            
            let value;
            switch(aggregationType) {
                case 'sum':
                    value = categoryData.total;
                    break;
                case 'average':
                    value = categoryData.average;
                    break;
                case 'min':
                    value = categoryData.min;
                    break;
                case 'max':
                    value = categoryData.max;
                    break;
                case 'count':
                    value = categoryData.count;
                    break;
                default:
                    value = categoryData.total;
            }
            
            return {
                period: entry.period,
                value: value,
                trend: categoryData.trend
            };
        });
        
        return result;
    }
    
    /**
     * 比較分析
     */
    comparePerformance(category: string, period1: any, period2: any): any {
        const data1 = this.getTimeSeriesData('daily', category,
            this.getDateFromPeriod(period1.start),
            this.getDateFromPeriod(period1.end)
        );
        
        const data2 = this.getTimeSeriesData('daily', category,
            this.getDateFromPeriod(period2.start),
            this.getDateFromPeriod(period2.end)
        );
        
        const stats1 = this.calculatePeriodStats(data1, category);
        const stats2 = this.calculatePeriodStats(data2, category);
        
        return {
            period1: { ...period1, stats: stats1 },
            period2: { ...period2, stats: stats2 },
            comparison: {
                totalChange: stats2.total - stats1.total,
                totalChangePercent: stats1.total > 0 ?
                    ((stats2.total - stats1.total) / stats1.total) * 100 : 0,
                averageChange: stats2.average - stats1.average,
                averageChangePercent: stats1.average > 0 ?
                    ((stats2.average - stats1.average) / stats1.average) * 100 : 0,
                trend: stats2.average > stats1.average ? 'improving' :
                       stats2.average < stats1.average ? 'declining' : 'stable'
            }
        };
    }
    
    /**
     * 期間統計の計算
     */
    calculatePeriodStats(data: any[], category: string): any {
        if (data.length === 0) {
            return { total: 0, average: 0, min: 0, max: 0, count: 0 };
        }
        
        let total = 0;
        let count = 0;
        let min = Infinity;
        let max = -Infinity;
        
        data.forEach(entry => {
            const categoryData = entry.categories[category];
            if (categoryData) {
                total += categoryData.total;
                count += categoryData.count;
                min = Math.min(min, categoryData.min);
                max = Math.max(max, categoryData.max);
            }
        });
        
        return {
            total: total,
            average: count > 0 ? total / count : 0,
            min: min === Infinity ? 0 : min,
            max: max === -Infinity ? 0 : max,
            count: count
        };
    }
    
    /**
     * 期間キーの生成・解析
     */
    getDayKey(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    getWeekKey(date: Date): string {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }
    
    getMonthKey(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    parsePeriodKey(periodKey: string, period: string): Date {
        switch(period) {
            case 'daily':
                return new Date(periodKey);
            case 'weekly':
                const [year, week] = periodKey.split('-W');
                return this.getDateFromWeek(parseInt(year), parseInt(week));
            case 'monthly':
                const [monthYear, month] = periodKey.split('-');
                return new Date(parseInt(monthYear), parseInt(month) - 1, 1);
            default:
                return new Date();
        }
    }
    
    getDateFromWeek(year: number, week: number): Date {
        const firstDayOfYear = new Date(year, 0, 1);
        const daysToAdd = (week - 1) * 7 - firstDayOfYear.getDay();
        return new Date(year, 0, 1 + daysToAdd);
    }
    
    getDateFromPeriod(periodString: string): Date {
        return new Date(periodString);
    }
    
    /**
     * 現在の期間キーの更新
     */
    updateCurrentPeriodKeys(): any {
        const now = new Date();
        this.currentPeriodKeys = {
            day: this.getDayKey(now),
            week: this.getWeekKey(now),
            month: this.getMonthKey(now)
        };
        return this.currentPeriodKeys;
    }
    
    /**
     * データクリーンアップの設定
     */
    setupDataCleanup(): void {
        // 24時間ごとにクリーンアップ実行
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000);
    }
    
    /**
     * 古いデータのクリーンアップ
     */
    cleanupOldData(): void {
        this.cleanupDataMap(this.dailyData, this.maxDataPoints.daily);
        this.cleanupDataMap(this.weeklyData, this.maxDataPoints.weekly);
        this.cleanupDataMap(this.monthlyData, this.maxDataPoints.monthly);
        // クリーンアップ後に保存
        this.save();
    }
    
    cleanupDataMap(dataMap: Map<string, any>, maxPoints: number): void {
        if (dataMap.size <= maxPoints) return;
        
        // 期間キーでソートして古いものから削除
        const sortedKeys = Array.from(dataMap.keys()).sort();
        const keysToDelete = sortedKeys.slice(0, sortedKeys.length - maxPoints);
        
        keysToDelete.forEach(key => {
            // アーカイブに移動
            this.archiveManager.archiveData(key, dataMap.get(key));
            dataMap.delete(key);
        });
    }
    
    /**
     * 自動保存の設定
     */
    setupAutoSave(): void {
        setInterval(() => {
            this.save();
        }, this.saveInterval);
        
        // ページ離脱時の保存
        window.addEventListener('beforeunload', () => { 
            this.save();
        });
    }
    
    /**
     * 自動保存のチェック
     */
    checkAutoSave(): void {
        const now = Date.now();
        if (now - this.lastSaveTime >= this.saveInterval) {
            this.save();
            this.lastSaveTime = now;
        }
    }
    
    /**
     * データの保存
     */
    save(): void {
        try {
            const data = {
                daily: Array.from(this.dailyData.entries()),
                weekly: Array.from(this.weeklyData.entries()),
                monthly: Array.from(this.monthlyData.entries()),
                currentPeriodKeys: this.currentPeriodKeys,
                lastSaveTime: Date.now()
            };
            
            // Mapを配列に変換してから保存
            const serializedData = this.serializeData(data);
            localStorage.setItem('bubblePop_timeSeries', JSON.stringify(serializedData));
        } catch (error) {
            console.error('Failed to save time series data:', error);
        }
    }
    
    /**
     * データの読み込み
     */
    load(): void {
        try {
            const savedData = localStorage.getItem('bubblePop_timeSeries');
            if (savedData) {
                const data = JSON.parse(savedData);
                const deserializedData = this.deserializeData(data);
                
                this.dailyData = new Map(deserializedData.daily || []);
                this.weeklyData = new Map(deserializedData.weekly || []);
                this.monthlyData = new Map(deserializedData.monthly || []);
                this.currentPeriodKeys = deserializedData.currentPeriodKeys || this.updateCurrentPeriodKeys();
            }
        } catch (error) {
            console.error('Failed to load time series data:', error);
            this.dailyData = new Map();
            this.weeklyData = new Map();
            this.monthlyData = new Map();
        }
    }
    
    /**
     * データのシリアライゼーション
     */
    serializeData(data: any): any {
        const serialized = { ...data };
        
        // Map内のMapをオブジェクトに変換
        ['daily', 'weekly', 'monthly'].forEach(period => {
            serialized[period] = data[period].map(([key, value]: [string, any]) => [key, {
                ...value,
                categories: Array.from(value.categories.entries())
            }]);
        });
        
        return serialized;
    }
    
    /**
     * データのデシリアライゼーション
     */
    deserializeData(data: any): any {
        const deserialized = { ...data };
        
        // オブジェクトをMapに変換
        ['daily', 'weekly', 'monthly'].forEach(period => {
            if (data[period]) {
                deserialized[period] = data[period].map(([key, value]: [string, any]) => [key, {
                    ...value,
                    categories: new Map(value.categories || [])
                }]);
            }
        });
        
        return deserialized;
    }
    
    /**
     * データのリセット
     */
    reset(): void {
        this.dailyData.clear();
        this.weeklyData.clear();
        this.monthlyData.clear();
        this.currentPeriodKeys = this.updateCurrentPeriodKeys();
        this.save();
    }
    
    /**
     * 統計サマリーの取得
     */
    getStatisticsSummary(): any {
        return {
            dataPoints: {
                daily: this.dailyData.size,
                weekly: this.weeklyData.size,
                monthly: this.monthlyData.size
            },
            currentPeriods: this.currentPeriodKeys,
            categories: this.getAllCategories(),
            dateRange: this.getDateRange(),
            lastUpdate: this.lastSaveTime
        };
    }
    
    /**
     * 全カテゴリの取得
     */
    getAllCategories(): string[] {
        const categories = new Set<string>();
        
        [this.dailyData, this.weeklyData, this.monthlyData].forEach(dataMap => {
            for(const [key, value] of dataMap.entries()) {
                for (const category of value.categories.keys()) {
                    categories.add(category);
                }
            }
        });
        
        return Array.from(categories);
    }
    
    /**
     * データ期間の取得
     */
    getDateRange(): any {
        const allKeys = [
            ...Array.from(this.dailyData.keys()),
            ...Array.from(this.weeklyData.keys()),
            ...Array.from(this.monthlyData.keys())
        ];
        
        if (allKeys.length === 0) {
            return { start: null, end: null };
        }
        
        allKeys.sort();
        return {
            start: allKeys[0],
            end: allKeys[allKeys.length - 1]
        };
    }
}

/**
 * データ圧縮管理クラス
 */
class DataCompressionManager {
    private compressionThreshold: number;

    constructor() {
        this.compressionThreshold = 1000; // データポイント数
    }
    
    compress(data: any): string {
        // 簡単な圧縮実装（実際にはより複雑な圧縮アルゴリズムを使用）
        try {
            return JSON.stringify(data);
        } catch (error) {
            console.error('Data compression failed:', error);
            return data;
        }
    }
    
    decompress(compressedData: string): any {
        try {
            return JSON.parse(compressedData);
        } catch (error) {
            console.error('Data decompression failed:', error);
            return compressedData;
        }
    }
}

/**
 * データアーカイブ管理クラス
 */
class DataArchiveManager {
    private archiveStorage: Map<string, any>;
    private maxArchiveSize: number;

    constructor() {
        this.archiveStorage = new Map();
        this.maxArchiveSize = 1000; // アーカイブエントリ数
    }
    
    archiveData(key: string, data: any): void {
        this.archiveStorage.set(key, {
            data: data,
            archivedAt: Date.now()
        });
        
        // アーカイブサイズ制限
        if (this.archiveStorage.size > this.maxArchiveSize) {
            const oldestKey = Array.from(this.archiveStorage.keys())[0];
            this.archiveStorage.delete(oldestKey);
        }
    }
    
    getArchivedData(key: string): any {
        return this.archiveStorage.get(key);
    }
    
    clearArchive(): void {
        this.archiveStorage.clear();
    }
}