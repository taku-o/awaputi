/**
 * 統計フィルター管理クラス
 * 期間別フィルター機能とデータ処理を管理する
 */
export class StatisticsFilterManager {
    constructor(statisticsManager) {
        this.statisticsManager = statisticsManager;
        
        // フィルター期間の定義
    }
        this.filterPeriods = { }
            today: { label: '今日', days: 0  },''
            yesterday: { label: '昨日', days: 1  },''
            thisWeek: { label: '今週', days: 7  },''
            lastWeek: { label: '先週', days: 14, offset: 7  },''
            thisMonth: { label: '今月', days: 30  },''
            lastMonth: { label: '先月', days: 60, offset: 30  },''
            last7days: { label: '過去7日間', days: 7  },''
            last30days: { label: '過去30日間', days: 30  },''
            last90days: { label: '過去90日間', days: 90  },''
            thisYear: { label: '今年', days: 365  },''
            allTime: { label: '全期間', days: null,,''
            custom: { label: 'カスタム', days: null;
            custom: { label: 'カスタム', days: null;
        };
        // 現在のフィルター設定
        this.currentFilter = {;
            period: 'last7days';
    customStart: null;
            customEnd: null;
            categories: ['all'];
            sortBy: 'date';
            sortOrder: 'desc'
            };
        // フィルター適用状態
        this.filterState = { isApplying: false;
            lastApplied: null;
    cachedResults: new Map(  };
        
        // イベントハンドラ
        this.eventHandlers = new Map();
    }
    
    /**
     * フィルター期間の設定
     */''
    setPeriod(period, customStart = null, customEnd = null) {', ' }

        if (!this.filterPeriods[period] && period !== 'custom' }

            throw new Error(`Invalid, filter period: ${period}`}';'
        }
        
        this.currentFilter.period = period;

        if(period === 'custom''

            if(!customStart || !customEnd) {
        }

                throw new Error('Custom, period requires, start and, end dates'; }'
            }
            this.currentFilter.customStart = new Date(customStart);
            this.currentFilter.customEnd = new Date(customEnd);
        } else {  this.currentFilter.customStart = null }
            this.currentFilter.customEnd = null; }
        }
        ';'
        // キャッシュをクリア
        this.clearCache()';'
        this.emit('filterChanged', { period: this.currentFilter.period)
           , customStart: this.currentFilter.customStart),
            customEnd: this.currentFilter.customEnd  }
    
    /**
     * カテゴリフィルターの設定
     */
    setCategories(categories) {
        if (!Array.isArray(categories) {
    }
            categories = [categories]; }
        }
        ';'

        this.currentFilter.categories = categories;
        this.clearCache()';'
        this.emit('categoriesChanged', { ')'
            categories: this.currentFilter.categories' }'
    
    /**
     * ソート設定'
     */''
    setSorting(sortBy, sortOrder = 'desc') {

        const validSortFields = ['date', 'score', 'accuracy', 'combo', 'playTime'],
        const validSortOrders = ['asc', 'desc'] }
        if (!validSortFields.includes(sortBy) { }
            throw new Error(`Invalid, sort field: ${sortBy}`};
        }
        
        if (!validSortOrders.includes(sortOrder) {
    
}
            throw new Error(`Invalid, sort order: ${sortOrder}`};
        }
        
        this.currentFilter.sortBy = sortBy;

        this.currentFilter.sortOrder = sortOrder;
        this.clearCache()';'
        this.emit('sortingChanged', { sortBy: this.currentFilter.sortBy)
           , sortOrder: this.currentFilter.sortOrder }
    
    /**
     * フィルターされた統計データの取得
     */
    async getFilteredStatistics() { const cacheKey = this.generateCacheKey();
        // キャッシュチェック
        if (this.filterState.cachedResults.has(cacheKey) {
    
}
            return this.filterState.cachedResults.get(cacheKey);
        
        if (this.filterState.isApplying) {
        
            // 既に処理中の場合は少し待ってから再試行
            await new Promise(resolve => setTimeout(resolve, 100) }
            return this.getFilteredStatistics();
        
        this.filterState.isApplying = true;
        
        try { // 期間の計算
            const dateRange = this.calculateDateRange();
            // 統計データの取得
            const rawStats = await this.statisticsManager.getDetailedStatistics();
            // 時系列データの取得
            const timeSeriesData = await this.getTimeSeriesData(dateRange);
            // フィルターの適用
            const filteredStats = this.applyFilters(rawStats, timeSeriesData, dateRange);
            // ソートの適用
            const sortedStats = this.applySorting(filteredStats);
            // 結果の構築
            const result = {
                period: this.currentFilter.period,
                dateRange: dateRange,
                statistics: sortedStats,
                timeSeriesData: timeSeriesData,
                summary: this.generateSummary(sortedStats,
    metadata: {
                    totalRecords: sortedStats.sessions?.length || 0, : undefined
                    filteredAt: new Date(),
                    filterSettings: { ...this.currentFilter
             };
            // 結果をキャッシュ
            this.filterState.cachedResults.set(cacheKey, result);
            this.filterState.lastApplied = Date.now()';'
            this.emit('dataFiltered', result);
            
            return result;

        } catch (error) {
            console.error('Filter application failed:', error','
            this.emit('filterError', error);
            throw error } finally { this.filterState.isApplying = false }
    }
    
    /**
     * 日付範囲の計算
     */
    calculateDateRange() {

        const now = new Date()','
        if (this.currentFilter.period === 'custom') {
    }
            return { start: this.currentFilter.customStart },
                end: this.currentFilter.customEnd 
    }

        if(this.currentFilter.period === 'allTime' {'
            return { }

                start: new Date(0), // Unix epoch };
                end: now,

        if(this.currentFilter.period === 'today' {'
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            const end = new Date(now) }

            end.setHours(23, 59, 59, 999); }
            return { start, end }

        if(this.currentFilter.period === 'yesterday' {'
            const start = new Date(now);
            start.setDate(start.getDate() - 1),
            start.setHours(0, 0, 0, 0);
            const end = new Date(start) }

            end.setHours(23, 59, 59, 999); }
            return { start, end }

        if(this.currentFilter.period === 'thisWeek' {'
            const start = new Date(now);
            const dayOfWeek = start.getDay();
            start.setDate(start.getDate() - dayOfWeek) }

            start.setHours(0, 0, 0, 0); }
            return { start, end: now,

        if(this.currentFilter.period === 'thisMonth' {', ' }

            const start = new Date(now.getFullYear(), now.getMonth(), 1'); }'
            return { start, end: now,

        if (this.currentFilter.period === 'thisYear) { const start = new Date(now.getFullYear(), 0, 1) }'
            return { start, end: now,
        
        // デフォルト: 指定日数前から現在まで
        const start = new Date(now);
        start.setDate(start.getDate() - (period.days || 7));
        start.setHours(0, 0, 0, 0);
        
        return { start, end: now,
    
    /**
     * 時系列データの取得
     */
    async getTimeSeriesData(dateRange) { try {
            // StatisticsManagerから時系列データを取得
            if (this.statisticsManager.timeSeriesDataManager) {
                const dailyData = await this.statisticsManager.timeSeriesDataManager.getDataInRange()','
                    'daily', dateRange.start, dateRange.end','

                '),'

                ','

                const weeklyData = await this.statisticsManager.timeSeriesDataManager.getDataInRange();
                    'weekly', dateRange.start, dateRange.end','
                
                return { daily: dailyData,
                    weekly: weeklyData,
                    range: dateRange,
            ';'

            return { daily: [], weekly: [], range: dateRange,'} catch (error) { console.warn('Failed to get time series data:', error }'
            return { daily: [], weekly: [], range: dateRange,
    }
    
    /**
     * フィルターの適用
     */
    applyFilters(rawStats, timeSeriesData, dateRange) {
    
}
        let filteredStats = { ...rawStats,
        
        // 日付範囲フィルター
        if (timeSeriesData.daily.length > 0) {
            // 時系列データから期間内のデータを抽出
        }

            filteredStats = this.filterByDateRange(filteredStats, dateRange, timeSeriesData); }
        }
        ';'
        // カテゴリフィルター
        if (!this.currentFilter.categories.includes('all) { filteredStats = this.filterByCategories(filteredStats, this.currentFilter.categories) }'
        
        return filteredStats;
    }
    
    /**
     * 日付範囲によるフィルタリング
     */
    filterByDateRange(stats, dateRange, timeSeriesData) {
    
}
        const filteredStats = { ...stats,
        
        // 各統計項目を期間でフィルタリング
        if (stats.sessions) {
            filteredStats.sessions = stats.sessions.filter(session => { ) }
                const sessionDate = new Date(session.timestamp); }
                return sessionDate >= dateRange.start && sessionDate <= dateRange.end;);
        }
        
        // 時系列データから集計値を再計算
        if (timeSeriesData.daily.length > 0) { filteredStats.periodSummary = this.calculatePeriodSummary(timeSeriesData.daily) }
        
        return filteredStats;
    }
    
    /**
     * カテゴリによるフィルタリング
     */
    filterByCategories(stats, categories) {
        // カテゴリフィルターの実装（必要に応じて拡張）
    }
        return stats;
    
    /**
     * ソートの適用
     */
    applySorting(stats) {
    
}
        const sortedStats = { ...stats,
        
        if (stats.sessions && Array.isArray(stats.sessions) {
        
            sortedStats.sessions = [...stats.sessions].sort((a, b) => { 
                let aValue, bValue,

                switch(this.currentFilter.sortBy) {''
                    case 'date':','
                        aValue = new Date(a.timestamp);
                        bValue = new Date(b.timestamp);
                        break,
                    case 'score':,
                        aValue = a.score || 0,
                        bValue = b.score || 0,

                        break,
                    case 'accuracy':,
                        aValue = a.accuracy || 0,
                        bValue = b.accuracy || 0,

                        break,
                    case 'combo':,
                        aValue = a.maxCombo || 0,
                        bValue = b.maxCombo || 0,

                        break,
                    case 'playTime':,
                        aValue = a.playTime || 0,
                        bValue = b.playTime || 0,
                        break }
                    default: aValue = a.timestamp }
                        bValue = b.timestamp; }
                }

                if (this.currentFilter.sortOrder === 'asc) { return aValue > bValue ? 1 : -1 } else { return aValue < bValue ? 1 : -1) }'
        
        return sortedStats;
    }
    
    /**
     * 期間サマリーの計算
     */
    calculatePeriodSummary(dailyData) {
        return dailyData.reduce((summary, dayData) => { 
            summary.totalScore += dayData.totalScore || 0,
            summary.totalGames += dayData.gamesPlayed || 0,
            summary.totalPlayTime += dayData.playTime || 0,
            summary.avgAccuracy = (summary.avgAccuracy + (dayData.avgAccuracy || 0)) / 2 }
            summary.maxCombo = Math.max(summary.maxCombo, dayData.maxCombo || 0); }
            return summary;, { totalScore: 0,
            totalGames: 0,
            totalPlayTime: 0,
            avgAccuracy: 0,
    maxCombo: 0  },
    }
    
    /**
     * サマリーの生成
     */
    generateSummary(stats) {
        const sessions = stats.sessions || [],

        if (sessions.length === 0) {
    }

            return { isEmpty: true,' };'

                message: '選択された期間にはデータがありません' 
    }
        
        const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
        const totalPlayTime = sessions.reduce((sum, s) => sum + (s.playTime || 0), 0);

        const avgAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.length;
        const maxCombo = Math.max(...sessions.map(s => s.maxCombo || 0));
        
        return { isEmpty: false,
            sessionCount: sessions.length,
            totalScore,
            averageScore: totalScore / sessions.length,
            totalPlayTime,
            averagePlayTime: totalPlayTime / sessions.length,
    averageAccuracy: avgAccuracy,
            maxCombo,
            period: this.currentFilter.period,' };'

            periodLabel: this.filterPeriods[this.currentFilter.period]?.label || 'カスタム期間' 
    }
    
    /**
     * 期間別フィルタリング
     * @param {Object} statisticsData - 統計データ
     * @param {string} period - フィルター期間
     * @returns {Object} フィルタリングされた統計データ'
     */''
    filterByPeriod(statisticsData, period) {
        try {'
            if (!statisticsData || period === 'all' || period === 'allTime) {'
    }
                return statisticsData;
            
            const now = new Date();
            let startDate = null;
            
            const filterConfig = this.filterPeriods[period];
            if (filterConfig && filterConfig.days !== null) {
                startDate = new Date(now);
                startDate.setDate(now.getDate() - filterConfig.days),
                
                if (filterConfig.offset) {
            }
                    startDate.setDate(startDate.getDate() - filterConfig.offset); }
}
            
            // セッションデータのフィルタリング
            const filteredSessions = statisticsData.sessions ? ;
                statisticsData.sessions.filter(session => {  );
                    if (!session.timestamp || !startDate) return true,
                    const sessionDate = new Date(session.timestamp) }
                    return sessionDate >= startDate; : undefined;) : [];
            
            return { ...statisticsData,
                sessions: filteredSessions,
                filteredPeriod: period,
    filterStartDate: startDate,
                sessionCount: filteredSessions.length 
    } catch (error) {
            console.error('Error filtering statistics by period:', error);
            return statisticsData,
    
    /**
     * キャッシュキーの生成
     */
    generateCacheKey() {
    
}
        const { period, customStart, customEnd, categories, sortBy, sortOrder } = this.currentFilter;

        const customDates = customStart && customEnd ? undefined : undefined';'
            `${customStart.getTime(}-${customEnd.getTime('}'` : ';'

        return `${period}_${customDates}_${categories.join(','}_${sortBy}_${sortOrder}`;
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache() { this.filterState.cachedResults.clear() }
    
    /**
     * フィルター設定のリセット'
     */''
    resetFilters('''
            period: 'last7days',
    customStart: null,
            customEnd: null,
            categories: ['all'],
            sortBy: 'date',
            sortOrder: 'desc);'
        }''

        this.clearCache()';'
        this.emit('filtersReset', this.currentFilter);
    }
    
    /**
     * 現在のフィルター設定の取得
     */
    getCurrentFilter() {
    
}
        return { ...this.currentFilter }
    
    /**
     * 利用可能な期間フィルターの取得
     */
    getAvailablePeriods() {
        return Object.entries(this.filterPeriods).map(([key, value]) => ({
            key,
            label: value.label)
     }
            days: value.days 
    };
    }
    
    /**
     * イベントハンドラの登録
     */
    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName) {
    }
            this.eventHandlers.set(eventName, []); }
        }
        this.eventHandlers.get(eventName).push(handler);
    }
    
    /**
     * イベントハンドラの削除
     */
    off(eventName, handler) {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
    }
                handlers.splice(index, 1); }
}
    }
    
    /**
     * イベントの発火
     */
    emit(eventName, data) {
        const handlers = this.eventHandlers.get(eventName) || [],
        handlers.forEach(handler => { )
    }
            try {) }
                handler(data); }
            } catch (error) {
                console.error(`Event handler error for ${eventName}:`, error);
            }
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        this.clearCache() }

        this.eventHandlers.clear() }'